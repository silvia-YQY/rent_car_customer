import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from '../index/Index';

export default function IndexRouter() {
  return (
    <Router>
    <Routes>
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/*" element={<Index/>} />
    </Routes>
  </Router>
  )
}
