import { Decimal } from "decimal.js";

export interface ParsedFeedItem {
    external_id: string;
    product_name: string;
    description?: string;
    product_url: string;
    image_url?: string;
    additional_images: string[];
    price: Decimal;
    sale_price?: Decimal;
    currency: string;
    availability: "in_stock" | "out_of_stock" | "preorder";
    condition: "new" | "refurbished" | "used";
    brand?: string;
    gtin?: string;
    mpn?: string;
    google_category_id?: string;
    product_type?: string;
    shipping_weight?: string;
    attributes?: Record<string, unknown>;
}

export interface ParseResult {
    items: ParsedFeedItem[];
    errors: string[];
}

export interface FeedParser {
    parse(content: string): Promise<ParseResult>;
}

/**
 * Google Shopping XML Parser
 */
export class GoogleShoppingXMLParser implements FeedParser {
    async parse(content: string): Promise<ParseResult> {
        const items: ParsedFeedItem[] = [];
        const errors: string[] = [];

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, "text/xml");

            // Parse hatası kontrolü
            const parseError = xmlDoc.querySelector("parsererror");
            if (parseError) {
                throw new Error("XML parse hatası");
            }

            const channel = xmlDoc.querySelector("channel");
            if (!channel) {
                throw new Error("RSS channel bulunamadı");
            }

            const itemElements = channel.querySelectorAll("item");

            for (const element of itemElements) {
                try {
                    const item = this.parseItem(element);
                    items.push(item);
                } catch (error) {
                    const id =
                        element.querySelector("g\\\\:id, id")?.textContent || "bilinmeyen";
                    errors.push(
                        `Ürün ${id}: ${error instanceof Error ? error.message : "Parse hatası"
                        }`
                    );
                }
            }
        } catch (error) {
            errors.push(
                `Genel hata: ${error instanceof Error ? error.message : "Bilinmeyen hata"
                }`
            );
        }

        return { items, errors };
    }

    private parseItem(element: Element): ParsedFeedItem {
        const getText = (tag: string): string | undefined => {
            // g: ile başlayan veya sadece tag adı olan elementleri dene
            const selectors = [
                `g\\\\:${tag}`,
                tag,
                `${tag}`,
                `g\\\\:${tag.toLowerCase()}`,
            ];
            for (const selector of selectors) {
                const el = element.querySelector(selector);
                if (el?.textContent) {
                    return el.textContent.trim();
                }
            }
            return undefined;
        };

        const external_id = getText("id");
        if (!external_id) {
            throw new Error("ID alanı zorunlu");
        }

        const product_name = getText("title");
        if (!product_name) {
            throw new Error("Title alanı zorunlu");
        }

        const priceStr = getText("price");
        if (!priceStr) {
            throw new Error("Price alanı zorunlu");
        }

        // Fiyat parse et (örn: "100.00 TRY")
        const priceMatch = priceStr.match(/^([\d.,]+)\s*(\w+)?$/);
        if (!priceMatch) {
            throw new Error(`Geçersiz fiyat formatı: ${priceStr}`);
        }

        const priceValue = parseFloat(priceMatch[1].replace(",", "."));
        const currency = priceMatch[2] || "TRY";

        // Sale price parse et
        let salePrice: Decimal | undefined;
        const salePriceStr = getText("sale_price");
        if (salePriceStr) {
            const saleMatch = salePriceStr.match(/^([\d.,]+)\s*(\w+)?$/);
            if (saleMatch) {
                salePrice = new Decimal(parseFloat(saleMatch[1].replace(",", ".")));
            }
        }

        // Availability parse et
        let availability: ParsedFeedItem["availability"] = "in_stock";
        const availabilityStr = getText("availability");
        if (availabilityStr) {
            if (availabilityStr.includes("out of stock")) {
                availability = "out_of_stock";
            } else if (availabilityStr.includes("preorder")) {
                availability = "preorder";
            }
        }

        // Condition parse et
        let condition: ParsedFeedItem["condition"] = "new";
        const conditionStr = getText("condition");
        if (conditionStr) {
            if (conditionStr === "refurbished") {
                condition = "refurbished";
            } else if (conditionStr === "used") {
                condition = "used";
            }
        }

        // Ek görseller
        const additionalImages: string[] = [];
        element
            .querySelectorAll("g\\\\:additional_image_link, additional_image_link")
            .forEach((el) => {
                if (el.textContent) {
                    additionalImages.push(el.textContent.trim());
                }
            });

        return {
            external_id,
            product_name,
            description: getText("description"),
            product_url: getText("link") || "",
            image_url: getText("image_link"),
            additional_images: additionalImages,
            price: new Decimal(priceValue),
            sale_price: salePrice,
            currency,
            availability,
            condition,
            brand: getText("brand"),
            gtin: getText("gtin"),
            mpn: getText("mpn"),
            google_category_id: getText("google_product_category"),
            product_type: getText("product_type"),
            shipping_weight: getText("shipping_weight"),
            attributes: this.parseAttributes(element),
        };
    }

    private parseAttributes(
        element: Element
    ): Record<string, unknown> | undefined {
        const attributes: Record<string, unknown> = {};

        // g:color, g:size, g:material, g:pattern gibi alanları al
        const customElements = element.querySelectorAll("[^g\\\\:]");
        customElements.forEach((el) => {
            const tagName = el.tagName.toLowerCase();
            if (tagName.startsWith("g:") && el.textContent) {
                const attrName = tagName.replace("g:", "");
                attributes[attrName] = el.textContent.trim();
            }
        });

        return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
}

/**
 * Google Shopping CSV Parser
 */
export class GoogleShoppingCSVParser implements FeedParser {
    async parse(content: string): Promise<ParseResult> {
        const items: ParsedFeedItem[] = [];
        const errors: string[] = [];

        try {
            const lines = content.split(/\r?\n/).filter((line) => line.trim());
            if (lines.length < 2) {
                throw new Error("CSV dosyası boş veya geçersiz");
            }

            // Header satırını parse et
            const headers = this.parseCSVLine(lines[0]);

            // Her satırı parse et
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i]);
                    const row: Record<string, string> = {};

                    headers.forEach((header, index) => {
                        row[header.toLowerCase().trim()] = values[index] || "";
                    });

                    const item = this.parseRow(row, i + 1);
                    items.push(item);
                } catch (error) {
                    errors.push(
                        `Satır ${i + 1}: ${error instanceof Error ? error.message : "Parse hatası"
                        }`
                    );
                }
            }
        } catch (error) {
            errors.push(
                `Genel hata: ${error instanceof Error ? error.message : "Bilinmeyen hata"
                }`
            );
        }

        return { items, errors };
    }

    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    private parseRow(row: Record<string, string>, lineNumber: number): ParsedFeedItem {
        const id = row["id"] || "";
        if (!id) {
            throw new Error("ID alanı zorunlu");
        }

        const title = row["title"] || "";
        if (!title) {
            throw new Error("Title alanı zorunlu");
        }

        const priceStr = row["price"] || "";
        if (!priceStr) {
            throw new Error("Price alanı zorunlu");
        }

        // Fiyat parse et
        const priceMatch = priceStr.match(/^([\d.,]+)\s*(\w+)?$/);
        if (!priceMatch) {
            throw new Error(`Geçersiz fiyat formatı: ${priceStr}`);
        }

        const priceValue = parseFloat(priceMatch[1].replace(",", "."));
        const currency = priceMatch[2] || "TRY";

        // Sale price
        let salePrice: Decimal | undefined;
        const salePriceStr = row["sale_price"] || row["sale price"];
        if (salePriceStr) {
            const saleMatch = salePriceStr.match(/^([\d.,]+)\s*(\w+)?$/);
            if (saleMatch) {
                salePrice = new Decimal(parseFloat(saleMatch[1].replace(",", ".")));
            }
        }

        // Availability
        let availability: ParsedFeedItem["availability"] = "in_stock";
        const availabilityStr = row["availability"] || "";
        if (availabilityStr.includes("out")) {
            availability = "out_of_stock";
        } else if (availabilityStr.includes("preorder")) {
            availability = "preorder";
        }

        // Condition
        let condition: ParsedFeedItem["condition"] = "new";
        const conditionStr = row["condition"] || "";
        if (conditionStr === "refurbished") {
            condition = "refurbished";
        } else if (conditionStr === "used") {
            condition = "used";
        }

        // Ek görseller
        const additionalImages: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const imgKey = `additional_image_link_${i}`;
            if (row[imgKey]) {
                additionalImages.push(row[imgKey]);
            }
        }
        // Virgülle ayrılmış görseller
        if (row["additional_image_link"]) {
            additionalImages.push(
                ...row["additional_image_link"].split(",").map((s) => s.trim())
            );
        }

        return {
            external_id: id,
            product_name: title,
            description: row["description"],
            product_url: row["link"] || "",
            image_url: row["image_link"] || row["image link"],
            additional_images: additionalImages,
            price: new Decimal(priceValue),
            sale_price: salePrice,
            currency,
            availability,
            condition,
            brand: row["brand"],
            gtin: row["gtin"] || row["ean"] || row["upc"] || row["isbn"],
            mpn: row["mpn"] || row["manufacturer part number"],
            google_category_id: row["google_product_category"],
            product_type: row["product_type"],
            shipping_weight: row["shipping_weight"],
            attributes: undefined,
        };
    }
}

/**
 * TSV (Tab-Separated) Parser
 */
export class GoogleShoppingTSVParser extends GoogleShoppingCSVParser {
    async parse(content: string): Promise<ParseResult> {
        const items: ParsedFeedItem[] = [];
        const errors: string[] = [];

        try {
            const lines = content.split(/\r?\n/).filter((line) => line.trim());
            if (lines.length < 2) {
                throw new Error("TSV dosyası boş veya geçersiz");
            }

            const headers = lines[0].split("\t");

            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split("\t");
                    const row: Record<string, string> = {};

                    headers.forEach((header, index) => {
                        row[header.toLowerCase().trim()] = values[index] || "";
                    });

                    // Protected metoda erişim
                    const item = (this as any).parseRow(row, i + 1);
                    items.push(item);
                } catch (error) {
                    errors.push(
                        `Satır ${i + 1}: ${error instanceof Error ? error.message : "Parse hatası"
                        }`
                    );
                }
            }
        } catch (error) {
            errors.push(
                `Genel hata: ${error instanceof Error ? error.message : "Bilinmeyen hata"
                }`
            );
        }

        return { items, errors };
    }
}

/**
 * Parser Factory
 */
export class FeedParserFactory {
    static createParser(format: string): FeedParser {
        switch (format) {
            case "google_shopping_xml":
            case "xml":
                return new GoogleShoppingXMLParser();
            case "google_shopping_csv":
            case "csv":
                return new GoogleShoppingCSVParser();
            case "google_shopping_tsv":
            case "tsv":
                return new GoogleShoppingTSVParser();
            default:
                console.warn(`Bilinmeyen format: ${format}, varsayılan XML kullanılıyor`);
                return new GoogleShoppingXMLParser();
        }
    }
}