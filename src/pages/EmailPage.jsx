import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import EmailForm from '../components/Email/EmailForm';
import EmailHistory from '../components/Email/EmailHistory';
import EmailCharts from '../components/Email/EmailCharts';

const EmailPage = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EmailCharts />} />
        <Route path="/send" element={<EmailForm />} />
        <Route path="/history" element={<EmailHistory />} />
        <Route path="/charts" element={<EmailCharts />} />
      </Routes>
    </Layout>
  );
};

export default EmailPage;