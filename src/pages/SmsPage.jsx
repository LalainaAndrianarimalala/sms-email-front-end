import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import SmsHistory from '../components/Sms/SmsHistory';
import SmsInbox from '../components/Sms/SmsInbox';
import SmsForm from '../components/SMS/SmsForm';

const SmsPage = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SmsHistory />} />
        <Route path="/send" element={<SmsForm />} />
        <Route path="/history" element={<SmsHistory />} />
        <Route path="/inbox" element={<SmsInbox />} />
      </Routes>
    </Layout>
  );
};

export default SmsPage;