import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import SmsForm from '../components/Sms/SmsForm';
import SmsHistory from '../components/Sms/SmsHistory';
import SmsInbox from '../components/Sms/SmsInbox';
import SmsCharts from '../components/Sms/SmsCharts';

const SmsPage = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SmsCharts />} />
        <Route path="/send" element={<SmsForm />} />
        <Route path="/history" element={<SmsHistory />} />
        <Route path="/inbox" element={<SmsInbox />} />
        <Route path="/charts" element={<SmsCharts />} />
      </Routes>
    </Layout>
  );
};

export default SmsPage;