import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  useEffect(() => {
    let batteryRef = null;
    const updateMeta = (color) => {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = color;

      let apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!apple) {
        apple = document.createElement('meta');
        apple.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(apple);
      }
      apple.content = color === '#000000' ? 'black-translucent' : 'default';
    };

    const chooseColor = async () => {
      const isDark = document.documentElement.classList.contains('dark');
      const hour = new Date().getHours();
      let color = isDark ? '#0b1220' : '#ffffff';

      if (hour >= 18 || hour < 6) color = '#071026';
      else if (hour >= 6 && hour < 12) color = '#fff7ed';
      else color = isDark ? '#021827' : '#e6f7ff';

      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          batteryRef = battery;
          if (battery.level <= 0.15 && !battery.charging) {
            color = '#6b7280';
          }
          battery.addEventListener('levelchange', chooseColor);
          battery.addEventListener('chargingchange', chooseColor);
        } catch (e) {
          // ignore
        }
      }

      updateMeta(color);
    };

    chooseColor();

    const mo = new MutationObserver(() => chooseColor());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mo.disconnect();
      if (batteryRef) {
        try {
          batteryRef.removeEventListener('levelchange', chooseColor);
          batteryRef.removeEventListener('chargingchange', chooseColor);
        } catch (e) {}
      }
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
