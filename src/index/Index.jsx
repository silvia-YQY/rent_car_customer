import React from 'react';
import { Layout } from 'antd';
import TopHeader from '../components/TopHeader';
import ContentSection from '../content/ContentSection';
import './index.css';

const { Content, Footer } = Layout;

export default function Index() {
  return (
    <Layout className="layout">
      <TopHeader />
      <Content className="site-layout-content">
        <div className="site-layout-content">
          <ContentSection />
        </div>
      </Content>
      <Footer className="site-footer">DriveWise Rentals ©2024 Created</Footer>
    </Layout>
  );
}
