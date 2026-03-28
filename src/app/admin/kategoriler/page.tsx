"use client";

import { useState, useEffect } from "react";
import { Grid3X3, Plus, Pencil, Trash2, Store, Wrench } from "lucide-react";
import {
  PageHeader, Badge, SearchInput, LoadingSpinner, IconBtn,
} from "@/components/admin/ui";
import type { CategoryListItem, CategoriesListResponse, CreateCategoryBody } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState<{ name: string; type: string; icon: string }>({ name: "", type: "PRODUCT", icon: "" });
  const [editing, setEditing] = useState<CategoryListItem | null>(null);
  
  // Alert Dialog state
  const [catToDelete, setCatToDelete] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (typeFilter !== "ALL") p.set("type", typeFilter);
      if (search) p.set("search", search);
      const res = await fetch(`/api/admin/kategoriler?${p}`);
      const data: CategoriesListResponse = await res.json();
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter, search]);

  const handleDeleteConfirm = async () => {
    if (!catToDelete) return;
    try {
      const res = await fetch(`/api/admin/kategoriler/${catToDelete.id}`, { method: "DELETE" });
      if (res.ok) { 
        toast.success("Kategori silindi."); 
        load(); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error ?? "Silinemedi"); 
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setCatToDelete(null);
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.name.trim()) { 
      toast.error("Kategori adı zorunludur."); 
      return; 
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/kategoriler/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, type: editing.type, icon: editing.icon }),
      });
      if (res.ok) { 
        setEditing(null); 
        toast.success("Kategori güncellendi."); 
        load(); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error ?? "Güncellenemedi"); 
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!newCat.name.trim()) return;
    setSaving(true);
    try {
      const body: CreateCategoryBody = { name: newCat.name, type: newCat.type, icon: newCat.icon || undefined };
      const res = await fetch("/api/admin/kategoriler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { 
        setNewCat({ name: "", type: "PRODUCT", icon: "" }); 
        setAdding(false); 
        toast.success("Kategori oluşturuldu."); 
        load(); 
      } else { 
        const d = await res.json(); 
        toast.error(d.error ?? "Eklenemedi"); 
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const productCount = categories.filter(c => c.type === "PRODUCT" || c.type === "ecommerce").length;
  const serviceCount = categories.filter(c => c.type === "SERVICE" || c.type === "service").length;

  return (
    <>
      <PageHeader
        title="Kategori Yönetimi"
        description="Ürün ve hizmet kategorilerini yönetin"
        actions={[{ label: "Yeni Kategori", icon: Plus, variant: "primary", onClick: () => setAdding((v) => !v) }]}
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
            <DialogDescription className="hidden">Kategori detayları düzenle</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category_name">Kategori Adı *</Label>
              <Input 
                id="category_name" 
                value={editing?.name ?? ""} 
                onChange={(e) => editing && setEditing({ ...editing, name: e.target.value })} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category_type">Tip</Label>
              <Select 
                value={editing?.type ?? "PRODUCT"} 
                onValueChange={(val) => editing && setEditing({ ...editing, type: val })}
              >
                <SelectTrigger id="category_type">
                  <SelectValue placeholder="Kategori Tipi Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Ürün Kategorisi</SelectItem>
                  <SelectItem value="SERVICE">Hizmet Kategorisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category_icon">İkon (emoji)</Label>
              <Input 
                id="category_icon"
                placeholder="örn. 📦" 
                value={editing?.icon ?? ""} 
                onChange={(e) => editing && setEditing({ ...editing, icon: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
            <Button disabled={saving} onClick={handleEdit} className="bg-admin-accent hover:bg-admin-accent/90">
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!catToDelete} onOpenChange={(open) => !open && setCatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{catToDelete?.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Toplam",           value: categories.length, className: "text-admin-accent bg-admin-accent/10",  icon: Grid3X3 },
          { label: "Ürün Kategorisi",  value: productCount,      className: "text-purple-500 bg-purple-500/10",  icon: Store },
          { label: "Hizmet Kategorisi",value: serviceCount,      className: "text-amber-500 bg-amber-500/10", icon: Wrench },
        ].map((s, i) => (
          <Card key={i} className="p-5 flex items-center gap-4 border-border shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.className}`}>
              <s.icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className={`text-2xl font-extrabold tracking-tight mb-0.5 ${s.className.split(" ")[0]}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {adding && (
        <Card className="mb-6 border-admin-accent/30 shadow-sm relative overflow-visible">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold">Yeni Kategori Ekle</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_cat_name">Kategori Adı *</Label>
              <Input 
                id="new_cat_name" 
                placeholder="örn. Elektronik" 
                value={newCat.name} 
                onChange={(e) => setNewCat((v) => ({ ...v, name: e.target.value }))} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_cat_type">Tip</Label>
              <Select 
                value={newCat.type} 
                onValueChange={(val) => setNewCat((v) => ({ ...v, type: val }))}
              >
                <SelectTrigger id="new_cat_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Ürün Kategorisi</SelectItem>
                  <SelectItem value="SERVICE">Hizmet Kategorisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_cat_icon">İkon (emoji)</Label>
              <Input 
                id="new_cat_icon" 
                placeholder="📦" 
                value={newCat.icon} 
                onChange={(e) => setNewCat((v) => ({ ...v, icon: e.target.value }))} 
              />
            </div>
          </CardContent>
          <CardContent className="flex justify-end gap-3 pb-5 pt-0">
            <Button variant="outline" onClick={() => setAdding(false)}>İptal</Button>
            <Button disabled={saving} onClick={handleSave} className="bg-admin-accent hover:bg-admin-accent/90">
              {saving ? "Oluşturuluyor…" : "Oluştur"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="p-5 shadow-sm border-admin-border">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:items-center">
          <div className="flex gap-1 p-1 bg-muted border border-border rounded-lg inline-flex max-w-min">
            {(["ALL", "PRODUCT", "SERVICE"] as const).map((t) => (
              <Button 
                key={t}
                variant={typeFilter === t ? "default" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(t)} 
                className={`text-[13px] h-8 px-4 ${typeFilter === t ? "bg-admin-accent hover:bg-admin-accent/90 shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}
              >
                {t === "ALL" ? "Tümü" : t === "PRODUCT" ? "Ürün" : "Hizmet"}
              </Button>
            ))}
          </div>
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Kategori ara…" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isProduct = cat.type === "PRODUCT" || cat.type === "ecommerce";
              const colorClass = isProduct ? "text-purple-600 bg-purple-500/10 border-purple-500/20" : "text-amber-600 bg-amber-500/10 border-amber-500/20";
              const badgeVariant = isProduct ? "purple" : "yellow";

              return (
                <div key={cat.id} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-admin-accent/30 transition-colors group">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 border ${colorClass}`}>
                    {cat.icon ?? "📂"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate block">{cat.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={badgeVariant as any}>{isProduct ? "Ürün" : "Hizmet"}</Badge>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {cat._count.products + cat._count.services} kayıt
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 pr-1 group-hover:opacity-100 transition-opacity">
                    <IconBtn icon={Pencil} color="#f59e0b" title="Düzenle" onClick={() => setEditing(cat)} />
                    <IconBtn icon={Trash2} color="#f43f5e" title="Sil" onClick={() => setCatToDelete({ id: cat.id, name: cat.name })} />
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && <p className="text-muted-foreground text-sm col-span-full py-6 text-center">Kategori bulunamadı</p>}
          </div>
        )}
      </Card>
    </>
  );
}
