import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import EmailForm from '../components/Email/EmailForm';
import EmailHistory from '../components/Email/EmailHistory';

const EmailPage = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EmailHistory />} />
        <Route path="/send" element={<EmailForm />} />
        <Route path="/history" element={<EmailHistory />} />
      </Routes>
    </Layout>
  );
};

export default EmailPage;