
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Diamond } from "@/types/diamond";

interface AddDiamondDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (diamond: Partial<Diamond>) => void;
}

export function AddDiamondDialog({ open, onOpenChange, onAdd }: AddDiamondDialogProps) {
  const [formData, setFormData] = useState<Partial<Diamond>>({
    stock_number: "",
    shape: "Round",
    carat: 0,
    color: "D",
    clarity: "FL",
    cut: "Excellent",
    price: 0,
    lab: "",
    certificate_number: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    // Reset form
    setFormData({
      stock_number: "",
      shape: "Round",
      carat: 0,
      color: "D",
      clarity: "FL",
      cut: "Excellent",
      price: 0,
      lab: "",
      certificate_number: "",
    });
    onOpenChange(false);
  };

  const handleChange = (field: keyof Diamond, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Diamond</DialogTitle>
          <DialogDescription>
            Enter the details for the new diamond to add to your inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockNumber" className="font-medium">Stock Number *</Label>
                <Input
                  id="stockNumber"
                  value={formData.stock_number || ""}
                  onChange={(e) => handleChange("stock_number", e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shape">Shape *</Label>
                <Select value={formData.shape} onValueChange={(value) => handleChange("shape", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Round">Round</SelectItem>
                    <SelectItem value="Princess">Princess</SelectItem>
                    <SelectItem value="Cushion">Cushion</SelectItem>
                    <SelectItem value="Oval">Oval</SelectItem>
                    <SelectItem value="Pear">Pear</SelectItem>
                    <SelectItem value="Emerald">Emerald</SelectItem>
                    <SelectItem value="Asscher">Asscher</SelectItem>
                    <SelectItem value="Radiant">Radiant</SelectItem>
                    <SelectItem value="Marquise">Marquise</SelectItem>
                    <SelectItem value="Heart">Heart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carat">Carat Weight *</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.carat || ""}
                  onChange={(e) => handleChange("carat", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Select value={formData.color} onValueChange={(value) => handleChange("color", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="H">H</SelectItem>
                    <SelectItem value="I">I</SelectItem>
                    <SelectItem value="J">J</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clarity">Clarity *</Label>
                <Select value={formData.clarity} onValueChange={(value) => handleChange("clarity", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FL">FL</SelectItem>
                    <SelectItem value="IF">IF</SelectItem>
                    <SelectItem value="VVS1">VVS1</SelectItem>
                    <SelectItem value="VVS2">VVS2</SelectItem>
                    <SelectItem value="VS1">VS1</SelectItem>
                    <SelectItem value="VS2">VS2</SelectItem>
                    <SelectItem value="SI1">SI1</SelectItem>
                    <SelectItem value="SI2">SI2</SelectItem>
                    <SelectItem value="I1">I1</SelectItem>
                    <SelectItem value="I2">I2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cut">Cut *</Label>
                <Select value={formData.cut} onValueChange={(value) => handleChange("cut", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lab">Lab</Label>
                <Input
                  id="lab"
                  value={formData.lab || ""}
                  onChange={(e) => handleChange("lab", e.target.value)}
                  placeholder="e.g., GIA, EGL, AGS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  value={formData.certificate_number || ""}
                  onChange={(e) => handleChange("certificate_number", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Diamond</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
