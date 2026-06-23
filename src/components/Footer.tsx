import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 sm:px-6">
        <div>
          <div className="font-display text-xl font-bold">
            Dorama<span className="text-primary">Moz</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            A primeira plataforma de doramas 100% moçambicanos. Acesso vitalício por apenas 60 MT.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Plataforma</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Catálogo</Link></li>
            <li><Link to="/pagamento" className="hover:text-foreground">Desbloquear</Link></li>
            <li><Link to="/perfil" className="hover:text-foreground">A minha conta</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Suporte</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>FAQ</li>
            <li>Termos &amp; condições</li>
            <li>Política de privacidade</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Pagamento</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>M-Pesa</li>
            <li>E-Mola</li>
            <li>Pagamento único 60 MT</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} DoramaMoz · Feito com ❤ em Moçambique
      </div>
    </footer>
  );
}
