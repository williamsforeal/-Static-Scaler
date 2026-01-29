import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/magpie';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onViewDetails?: (productId: string) => void;
}

export function ProductTable({ products, onViewDetails }: ProductTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-primary';
    if (score >= 70) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="text-primary">Product</TableHead>
            <TableHead className="text-primary">Category</TableHead>
            <TableHead className="text-primary text-center">Score</TableHead>
            <TableHead className="text-primary text-right">Margin</TableHead>
            <TableHead className="text-primary">Trending On</TableHead>
            <TableHead className="text-primary text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="border-b border-border/50 hover:bg-primary/5 hover:border-l-4 hover:border-l-primary transition-all duration-150"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {product.velocity === 'up' && (
                    <TrendingUp className="text-primary h-4 w-4" />
                  )}
                  <span>{product.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.category}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`text-lg font-bold ${getScoreColor(product.score)}`}
                >
                  {product.score}
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground">
                ${product.margin}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(product.trendingOn)
                    ? product.trendingOn
                    : [product.trendingOn]
                  ).map((platform) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => onViewDetails?.(product.id)}
                >
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
