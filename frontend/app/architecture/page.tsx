import React from 'react';
import PageWrapper from '@/components/global/PageWrapper';

const DiagramCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-bg-secondary p-6 rounded-lg border border-white/10">
      <h3 className="text-2xl font-bold text-text-primary mb-4">{title}</h3>
      <div className="bg-black/20 p-8 rounded-md min-h-[200px] flex justify-center items-center">
        {children}
      </div>
    </div>
)

const ArchitecturePage = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-text-primary mb-8">System Architecture</h1>
        <div className="space-y-8">
            <DiagramCard title="Kubernetes Deployment">
                <p className="text-text-secondary">_K8S DIAGRAM PLACEHOLDER_</p>
            </DiagramCard>
             <DiagramCard title="CI/CD Pipeline">
                <p className="text-text-secondary">_PIPELINE DIAGRAM PLACEHOLDER_</p>
            </DiagramCard>
             <DiagramCard title="Event-Driven Flow (Kafka -> Dapr)">
                <p className="text-text-secondary">_EVENT FLOW DIAGRAM PLACEHOLDER_</p>
            </DiagramCard>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ArchitecturePage;
