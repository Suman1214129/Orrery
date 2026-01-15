'use client';

// ==========================================================================
// GRAPH VIEW - Intelligent Graph Only
// ==========================================================================
import { IntelligentGraphView } from '@/components/graph/IntelligentGraphView';

// ==========================================================================
// GRAPH PAGE - Now only shows Intelligent Graph
// ==========================================================================
export default function GraphPage() {
     return (
          <div className="relative h-full w-full overflow-hidden">
               <IntelligentGraphView />
          </div>
     );
}
