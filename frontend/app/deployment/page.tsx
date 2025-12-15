"use client";

import React from 'react';
import PageWrapper from '@/components/global/PageWrapper';
import { motion } from 'framer-motion';

const StatusIndicator = ({ status }: { status: 'Healthy' | 'Degraded' }) => (
    <div className="flex items-center gap-2">
        <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} 
        />
        <span className={`${status === 'Healthy' ? 'text-green-400' : 'text-yellow-400'}`}>{status}</span>
    </div>
)

const DeploymentPage = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-text-primary mb-8">Deployment Status</h1>
        <div className="bg-bg-secondary border border-white/10 rounded-lg divide-y divide-white/10">
            <div className="p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">Production</h3>
                    <p className="text-sm text-text-secondary">us-east-1</p>
                </div>
                <StatusIndicator status="Healthy" />
            </div>
            <div className="p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">Staging</h3>
                    <p className="text-sm text-text-secondary">us-west-2</p>
                </div>
                <StatusIndicator status="Healthy" />
            </div>
             <div className="p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">Development</h3>
                    <p className="text-sm text-text-secondary">local</p>
                </div>
                <StatusIndicator status="Degraded" />
            </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DeploymentPage;
