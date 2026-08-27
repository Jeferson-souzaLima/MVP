// layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
