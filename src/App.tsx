import { Route, Routes } from 'react-router-dom';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import Layout from './components/Layout';
import Home from './pages/Home';
import { About, Article, Industries, Insights, NotFound, ServiceDetail, Services, Solutions } from './pages/Content';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
export default function App() { return <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation} strict><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="services" element={<Services/>}/><Route path="services/:slug" element={<ServiceDetail/>}/><Route path="solutions" element={<Solutions/>}/><Route path="industries" element={<Industries/>}/><Route path="insights" element={<Insights/>}/><Route path="insights/:slug" element={<Article/>}/><Route path="contact" element={<Contact/>}/><Route path="privacy" element={<Legal type="privacy"/>}/><Route path="terms" element={<Legal type="terms"/>}/><Route path="*" element={<NotFound/>}/></Route></Routes></LazyMotion></MotionConfig>; }
