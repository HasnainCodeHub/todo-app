import React from 'react';
import PageWrapper from '@/components/global/PageWrapper';
import HeroSection from '@/components/features/HeroSection';
import DeveloperSection from '@/components/DeveloperSection';

const Page = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <DeveloperSection />
    </PageWrapper>
  );
};

export default Page;