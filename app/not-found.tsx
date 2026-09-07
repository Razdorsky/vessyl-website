import { asset } from '../lib/paths';
import { Heading } from './components/Typography';
export default function NotFound() {
  return (
    <main className="not-found-page">
      <a href={asset('/classic/')} aria-label="Vessyl home">
        <img src={asset('/brand/logo-white.svg')} alt="Vessyl" width="190" />
      </a>
      <span className="eyebrow light">404</span>
      <Heading as="h1" text="Page not found" light />
      <a className="button cream" href={asset('/classic/')}>
        The Vessyl
      </a>
    </main>
  );
}
