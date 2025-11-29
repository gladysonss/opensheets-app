'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateApiToken } from './actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiTokenCardProps {
  currentApiToken: string | null;
}

export function ApiTokenCard({ currentApiToken }: ApiTokenCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateToken = () => {
    startTransition(async () => {
      const result = await generateApiToken();
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: result.message,
        });
      } else {
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleCopyToClipboard = () => {
    if (currentApiToken) {
      navigator.clipboard.writeText(currentApiToken);
      toast({
        title: 'Copiado!',
        description: 'O token de API foi copiado para a área de transferência.',
      });
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Token de API</CardTitle>
            <CardDescription>
                O seu token secreto. Não o compartilhe com ninguém.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <Input
                    readOnly
                    value={currentApiToken || 'Nenhum token gerado ainda.'}
                    className="flex-1"
                />
                <Button onClick={handleCopyToClipboard} disabled={!currentApiToken}>
                    Copiar
                </Button>
            </div>
        </CardContent>
        <CardFooter className='justify-end'>
            <Button onClick={handleGenerateToken} disabled={isPending}>
                {isPending ? 'Gerando...' : 'Gerar novo token'}
            </Button>
        </CardFooter>
    </Card>
  );
}
