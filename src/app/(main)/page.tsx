'use client';

// ==========================================================================
// MAIN PAGE - View Router
// ==========================================================================
import { useUIStore } from '@/stores/uiStore';
import EditorPage from './editor/page';
import GraphPage from './graph/page';

export default function MainPage() {
     const { currentView } = useUIStore();

     // Route to the appropriate view
     switch (currentView) {
          case 'graph':
               return <GraphPage />;
          case 'editor':
          default:
               return <EditorPage />;
     }
}
