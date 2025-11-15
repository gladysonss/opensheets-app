import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOptionalUserSession } from "@/lib/auth/server";
import {
  RiArrowRightSLine,
  RiBankCardLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiDeviceLine,
  RiEyeOffLine,
  RiLineChartLine,
  RiLockLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine,
  RiPieChartLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiWalletLine,
} from "@remixicon/react";
import Link from "next/link";

export default async function Page() {
  const session = await getOptionalUserSession();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            <AnimatedThemeToggler />
            {session?.user ? (
              <Link prefetch href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="gap-2">
                    Começar Grátis
                    <RiArrowRightSLine size={16} />
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center gap-6">
            <Badge variant="secondary" className="mb-2">
              <RiLineChartLine size={14} className="mr-1" />
              Controle Financeiro Inteligente
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Gerencie suas finanças
              <span className="text-primary"> com simplicidade</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Organize seus gastos, acompanhe receitas, gerencie cartões de
              crédito e tome decisões financeiras mais inteligentes. Tudo em um
              só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Começar Gratuitamente
                  <RiArrowRightSLine size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Fazer Login
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <RiShieldCheckLine size={18} className="text-primary" />
                Dados Seguros
              </div>
              <div className="flex items-center gap-2">
                <RiEyeOffLine size={18} className="text-primary" />
                Modo Privacidade
              </div>
              <div className="flex items-center gap-2">
                <RiDeviceLine size={18} className="text-primary" />
                100% Responsivo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Funcionalidades
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Tudo que você precisa para gerenciar suas finanças
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas e intuitivas para controle financeiro
                completo
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiWalletLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Lançamentos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Registre receitas e despesas com categorização
                        automática e controle detalhado de pagadores e contas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiBankCardLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Cartões de Crédito
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie múltiplos cartões, acompanhe faturas, limites e
                        nunca perca o controle dos gastos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiPieChartLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Categorias</h3>
                      <p className="text-sm text-muted-foreground">
                        Organize suas transações em categorias personalizadas e
                        visualize onde seu dinheiro está indo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiMoneyDollarCircleLine
                        size={24}
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Orçamentos</h3>
                      <p className="text-sm text-muted-foreground">
                        Defina limites de gastos por categoria e receba alertas
                        para manter suas finanças no caminho certo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiBarChartBoxLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Análise detalhada de padrões de gastos com gráficos e
                        relatórios para decisões mais inteligentes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <RiCalendarLine size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Calendário</h3>
                      <p className="text-sm text-muted-foreground">
                        Visualize suas transações em calendário mensal e nunca
                        perca prazos importantes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Vantagens
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Controle financeiro descomplicado
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <RiShieldCheckLine size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Segurança em Primeiro Lugar
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Seus dados financeiros são criptografados e armazenados
                        com os mais altos padrões de segurança.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <RiTimeLine size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Economize Tempo</h3>
                      <p className="text-sm text-muted-foreground">
                        Interface intuitiva que permite registrar transações em
                        segundos e acompanhar tudo de forma visual.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <RiNotificationLine size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Alertas Inteligentes
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre vencimentos, limites de
                        orçamento e padrões incomuns de gastos.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <RiEyeOffLine size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Modo Privacidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Oculte valores sensíveis com um clique para visualizar
                        suas finanças em qualquer lugar com discrição.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <RiLineChartLine
                        size={32}
                        className="text-primary shrink-0"
                      />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Visualização Clara
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Gráficos interativos e dashboards personalizáveis
                          mostram sua situação financeira de forma clara e
                          objetiva.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <RiDeviceLine
                        size={32}
                        className="text-primary shrink-0"
                      />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Acesso em Qualquer Lugar
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Design responsivo que funciona perfeitamente em
                          desktop, tablet e smartphone. Suas finanças sempre à
                          mão.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <RiLockLine size={32} className="text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Privacidade Garantida
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Seus dados são seus. Sem compartilhamento com
                          terceiros, sem anúncios, sem surpresas.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Pronto para transformar suas finanças?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Comece agora mesmo a organizar seu dinheiro de forma inteligente.
              É grátis e leva menos de um minuto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Criar Conta Gratuita
                  <RiArrowRightSLine size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />
              <p className="text-sm text-muted-foreground mt-4">
                Gerencie suas finanças pessoais com simplicidade e segurança.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Segurança
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Tutoriais
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} OpenSheets. Todos os direitos
              reservados.
            </p>
            <div className="flex items-center gap-2">
              <RiShieldCheckLine size={16} className="text-primary" />
              <span>Seus dados são protegidos e criptografados</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
