"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiDeleteBin5Line, RiMore2Fill, RiPencilLine } from "@remixicon/react";
import Link from "next/link";
import { TypeBadge } from "../type-badge";
import { CategoryIcon } from "./category-icon";
import type { Category } from "./types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onRemove: (category: Category) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onRemove,
}: CategoryCardProps) {
  // Categorias protegidas que não podem ser editadas ou removidas
  const categoriasProtegidas = [
    "Transferência interna",
    "Saldo inicial",
    "Pagamentos",
  ];
  const isProtegida = categoriasProtegidas.includes(category.name);
  const canEdit = !isProtegida;
  const canRemove = !isProtegida;

  return (
    <Card className="group py-2">
      <CardContent className="p-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="flex size-11 items-center justify-center text-primary">
              <CategoryIcon name={category.icon} className="size-6" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-medium leading-tight">
                <Link
                  href={`/categorias/${category.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {category.name}
                </Link>
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <TypeBadge type={category.type} />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <RiMore2Fill className="size-4" />
                <span className="sr-only">Abrir ações da categoria</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onEdit(category)}
                disabled={!canEdit}
              >
                <RiPencilLine className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onRemove(category)}
                disabled={!canRemove}
              >
                <RiDeleteBin5Line className="mr-2 size-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
