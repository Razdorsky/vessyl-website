import { ClassicSite } from './components/ClassicSite';
import { headerColor } from '../lib/header-theme';
export const viewport = { themeColor: headerColor('classic', 'home') };
export default function Page() {
  return <ClassicSite page="home" />;
}
