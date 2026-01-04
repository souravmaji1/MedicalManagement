'use client'

import React, { useState, useEffect } from 'react';
import { 
  Home, Users, FileText, Pill, AlertCircle, 
  TrendingUp, Calendar, Settings, Menu, X,
  Search, Bell, ChevronDown, Activity, MapPin,
  CheckCircle, Clock, AlertTriangle, Zap, Eye,PlayCircle,
  TrendingDown, BarChart3, Brain, Shield, Star,
  ChevronRight, Plus, Filter, Download, Award,
  Heart, Sparkles, ArrowRight, Lock, Globe, 
  Database, Cloud, ShieldCheck, Zap as Lightning,
  Target, PieChart, BarChart, Cpu, Code,
  Smartphone, Tablet, Laptop, Server,
  Users as Team, Award as Trophy, Clock as Time,
  HelpCircle, Mail, Phone, MessageSquare,
  Facebook, Twitter, Linkedin, Github
} from 'lucide-react';

const CareBridgeLanding = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState([
    { value: '0', label: 'Active Users', suffix: 'K+' },
    { value: '0', label: 'Compliance Rate', suffix: '%' },
    { value: '0', label: 'Organizations', suffix: '+' },
    { value: '0', label: 'Uptime', suffix: '%' }
  ]);

  useEffect(() => {
    // Animate counter values
    const targetValues = [25, 99.5, 156, 99.9];
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const counters = stats.map((_, index) => {
      let current = 0;
      const target = targetValues[index];
      const increment = target / steps;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        
        setStats(prev => prev.map((stat, i) => 
          i === index ? { ...stat, value: current.toFixed(i === 1 ? 1 : 0) } : stat
        ));
      }, stepDuration);
      
      return interval;
    });

    return () => counters.forEach(clearInterval);
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with end-to-end encryption',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Database,
      title: 'Real-time Analytics',
      description: 'Live dashboards and predictive insights',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Cloud,
      title: 'Cloud Native',
      description: 'Access anywhere, automatic updates',
      gradient: 'from-lime-500 to-green-500'
    },
    {
      icon: Target,
      title: 'IPMS Aligned',
      description: 'Built specifically for Alabama DD standards',
      gradient: 'from-teal-500 to-emerald-600'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Clinical Director',
      organization: 'Sunrise Care Network',
      content: 'CareBridge Pro reduced our documentation time by 65% while improving accuracy.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'QIDP Supervisor',
      organization: 'Harmony Homes',
      content: 'The real-time compliance tracking saved us during our state audit.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Executive Director',
      organization: 'Community Living Services',
      content: 'Implementation was seamless and our staff adoption rate hit 98% in the first month.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small organizations',
      features: ['Up to 10 individuals', 'Basic analytics', 'Email support', 'Core compliance'],
      gradient: 'from-slate-700 to-slate-800',
      cta: 'Get Started'
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Most popular choice',
      features: ['Up to 50 individuals', 'Advanced analytics', 'Priority support', 'HCBS tracking', 'Custom forms'],
      gradient: 'from-emerald-600 to-teal-500',
      cta: 'Try Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: ['Unlimited individuals', 'Dedicated support', 'White-labeling', 'API access', 'On-premise option'],
      gradient: 'from-slate-800 to-emerald-900',
      cta: 'Contact Sales'
    }
  ];

  const NavBar = () => (
    <nav className="fixed top-0 w-full bg-gradient-to-b from-slate-900/95 to-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                CareBridge Pro
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">IPMS EMR Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Solutions', 'Pricing', 'Resources', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-300 hover:text-emerald-400 font-medium text-sm transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.toLowerCase());
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-slate-300 hover:text-emerald-400 font-medium text-sm transition-colors duration-300">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
            <div className="px-6 py-4 space-y-4">
              {['Features', 'Solutions', 'Pricing', 'Resources', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-slate-300 hover:text-emerald-400 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3 border-t border-slate-800">
                <button className="w-full text-center text-slate-300 hover:text-emerald-400 font-medium py-3 transition-colors">
                  Sign In
                </button>
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const HeroSection = () => (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-bold">IPMS 2.0 Certified Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                Modern Care Management
              </span>
              <br />
              <span className="text-white">for Intellectual Disabilities</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Comprehensive EMR platform designed specifically for Alabama DD providers. 
              Streamline documentation, ensure compliance, and deliver exceptional care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="group bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </button>
              <button className="group bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center group hover:border-emerald-500/50 transition-all duration-300">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-black text-white">{stat.value}</span>
                  {stat.suffix && <span className="text-emerald-400 font-bold">{stat.suffix}</span>}
                </div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Preview */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-emerald-400" size={32} />
      </div>
    </section>
  );

  const FeaturesSection = () => (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              Everything You Need
            </span>
            <br />
            <span className="text-white">In One Platform</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Built with Alabama DD providers in mind. Every feature designed to save time and ensure compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl transform group-hover:scale-105 transition-all duration-300"></div>
                <div className="relative p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Demo Preview */}
        <div className="relative bg-gradient-to-br from-slate-800/30 to-emerald-900/20 border border-slate-700/50 rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-black text-white mb-6">
                Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Difference</span>
              </h3>
              <ul className="space-y-4">
                {[
                  'Real-time progress tracking',
                  'Automated compliance alerts',
                  'Integrated HCBS documentation',
                  'Mobile-optimized workflows',
                  'Advanced reporting suite',
                  'Customizable dashboards'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="text-emerald-400" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 text-center">
                    <span className="text-slate-400 text-sm font-medium">Dashboard Preview</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full"></div>
                  <div className="h-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full w-2/3"></div>
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="h-20 bg-emerald-500/10 rounded-xl"></div>
                    <div className="h-20 bg-emerald-500/10 rounded-xl"></div>
                    <div className="h-20 bg-emerald-500/10 rounded-xl"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <Zap className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const PricingSection = () => (
    <section id="pricing" className="py-20 bg-gradient-to-b from-slate-900 to-emerald-900/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-white">Simple, Transparent</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Pricing</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your organization. All plans include core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`relative group ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`bg-gradient-to-b ${plan.gradient} border border-slate-700/50 rounded-3xl p-8 h-full backdrop-blur-sm`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle className="text-emerald-400" size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-white text-emerald-600 hover:bg-slate-100 hover:scale-105' 
                    : 'bg-slate-800/50 text-white border border-slate-700 hover:border-emerald-500/50 hover:scale-105'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const TestimonialsSection = () => (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="text-white">Trusted by</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Leading Providers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-emerald-900/10 border border-slate-700/50 rounded-3xl transform group-hover:scale-105 transition-all duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-slate-300 italic text-lg mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-bold">{testimonial.name}</p>
                    <p className="text-emerald-400 text-sm">{testimonial.role}</p>
                    <p className="text-slate-400 text-sm">{testimonial.organization}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const CTASection = () => (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-900 to-teal-900/20">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
            <Zap size={16} className="text-emerald-400" />
            <span className="text-emerald-400 font-bold">30-Day Free Trial</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            <span className="text-white">Ready to Transform</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
              Your Care Management?
            </span>
          </h2>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of Alabama DD providers who trust CareBridge Pro for their compliance and documentation needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              Start Free Trial
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
            </button>
            <button className="group bg-slate-800/50 border border-slate-700 text-white px-10 py-5 rounded-xl font-bold text-lg hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              Schedule a Demo
              <Calendar className="group-hover:scale-110 transition-transform" size={24} />
            </button>
          </div>
          
          <p className="text-slate-500 text-sm mt-6">
            No credit card required • Cancel anytime • Full access to all features
          </p>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  CareBridge Pro
                </h3>
                <p className="text-xs text-slate-400 font-medium">IPMS Aligned EMR</p>
              </div>
            </div>
            <p className="text-slate-400 mb-6">
              Modern care management platform for intellectual disability providers in Alabama.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Facebook, Linkedin, Github].map((Icon, index) => (
                <a key={index} href="#" className="w-10 h-10 bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Icon className="text-slate-400 hover:text-emerald-400" size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {[
            {
              title: 'Product',
              links: ['Features', 'Solutions', 'Pricing', 'API', 'Documentation']
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Blog', 'Press', 'Contact']
            },
            {
              title: 'Legal',
              links: ['Privacy', 'Terms', 'Security', 'Compliance', 'HIPAA']
            }
          ].map((column, index) => (
            <div key={index}>
              <h4 className="text-white font-bold mb-6">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-800/50 mt-12 pt-8 text-center">
          <p className="text-slate-500">
            © {new Date().getFullYear()} CareBridge Pro. All rights reserved. 
            <span className="mx-2">•</span>
            Designed for Alabama DD providers
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="bg-slate-950 text-white overflow-hidden">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default CareBridgeLanding;