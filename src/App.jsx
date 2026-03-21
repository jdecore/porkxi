import Encabezado from './componentes/Encabezado';
import BannerAlerta from './componentes/BannerAlerta';
import TarjetasKpi from './componentes/TarjetasKpi';
import GraficaPrincipal from './componentes/GraficaPrincipal';
import ComparativaFrecuencia from './componentes/ComparativaFrecuencia';
import DetalleUltimoReporte from './componentes/DetalleUltimoReporte';
import TablaHistorica from './componentes/TablaHistorica';
import Explicacion from './componentes/Explicacion';
import PieDePagina from './componentes/PieDePagina';

function App() {
  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.2,
        mixBlendMode: 'multiply',
      }}>
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      <main>
        <Encabezado />
        <BannerAlerta />
        <TarjetasKpi />
        <GraficaPrincipal />
        <ComparativaFrecuencia />
        <DetalleUltimoReporte />
        <TablaHistorica />
        <Explicacion />
        <PieDePagina />
      </main>
    </>
  );
}

export default App;
