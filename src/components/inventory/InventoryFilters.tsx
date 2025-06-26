
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface InventoryFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({
    shape: "",
    color: "",
    clarity: "",
    caratMin: "",
    caratMax: "",
  });

  const shapes = [
    "Round", "Princess", "Cushion", "Emerald", 
    "Oval", "Pear", "Marquise", "Radiant", 
    "Asscher", "Heart"
  ];

  const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  
  const clarities = [
    "FL", "IF", "VVS1", "VVS2", 
    "VS1", "VS2", "SI1", "SI2", 
    "I1", "I2", "I3"
  ];

  const handleChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    // Apply filters immediately instead of waiting for Apply button
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {} as Record<string, string>);
    
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter size={16} />
          Filters
        </Button>
        
        {/* Filter pills - show when active */}
        {filters.shape && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={() => handleChange('shape', '')}
          >
            Shape: {filters.shape}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {filters.color && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={() => handleChange('color', '')}
          >
            Color: {filters.color}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {filters.clarity && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={() => handleChange('clarity', '')}
          >
            Clarity: {filters.clarity}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {(filters.caratMin || filters.caratMax) && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={() => {
              handleChange('caratMin', '');
              handleChange('caratMax', '');
            }}
          >
            Carat: {filters.caratMin || '0'} - {filters.caratMax || '∞'}
            <X size={14} className="ml-1" />
          </Button>
        )}
        
        {/* Clear all filters button - only show when at least one filter is active */}
        {(filters.shape || filters.color || filters.clarity || filters.caratMin || filters.caratMax) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="grid gap-4 p-4 mb-4 border rounded-lg bg-white shadow-lg z-50 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shape">Shape</Label>
              <Select
                value={filters.shape}
                onValueChange={(value) => handleChange('shape', value)}
              >
                <SelectTrigger id="shape">
                  <SelectValue placeholder="Any shape" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border shadow-lg">
                  <SelectItem value="">Any shape</SelectItem>
                  {shapes.map((shape) => (
                    <SelectItem key={shape} value={shape}>
                      {shape}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={filters.color}
                onValueChange={(value) => handleChange('color', value)}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border shadow-lg">
                  <SelectItem value="">Any color</SelectItem>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clarity">Clarity</Label>
              <Select
                value={filters.clarity}
                onValueChange={(value) => handleChange('clarity', value)}
              >
                <SelectTrigger id="clarity">
                  <SelectValue placeholder="Any clarity" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border shadow-lg">
                  <SelectItem value="">Any clarity</SelectItem>
                  {clarities.map((clarity) => (
                    <SelectItem key={clarity} value={clarity}>
                      {clarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caratMin">Carat (Min)</Label>
              <Input
                id="caratMin"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={filters.caratMin}
                onChange={(e) => handleChange('caratMin', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caratMax">Carat (Max)</Label>
              <Input
                id="caratMax"
                type="number"
                placeholder="No maximum"
                min="0"
                step="0.01"
                value={filters.caratMax}
                onChange={(e) => handleChange('caratMax', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
