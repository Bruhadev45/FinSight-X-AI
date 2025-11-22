"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddStockDialog({ open, onOpenChange, onSuccess }: AddStockDialogProps) {
    const [symbol, setSymbol] = useState("");
    const [shares, setShares] = useState("");
    const [costPerShare, setCostPerShare] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                if (data.success) {
                    setSearchResults(data.results);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!symbol || !shares || !costPerShare) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/portfolio/holdings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol,
                    shares: parseFloat(shares),
                    pricePerShare: parseFloat(costPerShare),
                    date,
                    portfolioId: "portfolio_1", // Hardcoded for now as per existing logic
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Successfully added ${symbol}`);
                onSuccess();
                onOpenChange(false);
                // Reset form
                setSymbol("");
                setShares("");
                setCostPerShare("");
                setDate(new Date().toISOString().split("T")[0]);
            } else {
                toast.error(data.error || "Failed to add stock");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Stock to Portfolio</DialogTitle>
                    <DialogDescription>
                        Enter the details of your stock purchase to track it in your portfolio.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="symbol">Stock Symbol</Label>
                        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={searchOpen}
                                    className="w-full justify-between"
                                >
                                    {symbol ? symbol : "Search for a stock..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search symbol or company..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        {searching && (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                Searching...
                                            </div>
                                        )}
                                        {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                            <CommandEmpty>No stocks found.</CommandEmpty>
                                        )}
                                        {!searching && searchQuery.length < 2 && (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                Type at least 2 characters to search
                                            </div>
                                        )}
                                        <CommandGroup>
                                            {searchResults.map((stock) => (
                                                <CommandItem
                                                    key={stock.symbol}
                                                    value={stock.symbol}
                                                    onSelect={(currentValue) => {
                                                        setSymbol(currentValue);
                                                        setSearchOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            symbol === stock.symbol ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{stock.symbol}</span>
                                                        <span className="text-xs text-muted-foreground">{stock.name}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="shares">Shares</Label>
                            <Input
                                id="shares"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cost">Cost per Share</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="cost"
                                    type="number"
                                    step="any"
                                    className="pl-7"
                                    placeholder="0.00"
                                    value={costPerShare}
                                    onChange={(e) => setCostPerShare(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Purchase Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Holding"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
