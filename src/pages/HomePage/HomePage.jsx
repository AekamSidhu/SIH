import React from 'react';
import './HomePage.css';
import Card from "../../components/Cards/Card";

const HomePage = () => (
  <>
    <div className="home-page-bg"></div>
    <section className="home-page">
      <div className="home-main-content">
        <h1>Welcome to Krishi Vaani</h1>
        <h2> Always available, Always learning, Always farmer first</h2>
       <div className={'kv'}>
           <button className='kv-but'><img src={'./brain.svg'}></img>Start Crop Analysis</button>
           <button className='kv-but'><img src={'./message.svg'}></img>Chat With Expert</button>
       </div>
      </div>
    </section>
    <section className="about-section">
      <div className="about-content">
        <h2>About Krishi Vaani</h2>
          <h3>Empowering farmers with cutting-edge AI technology and expert guidance</h3>
          <div className={'cards'}>
              <Card
                  title={'Mobile-First Platform'}
                  image={'./mob.svg'}
              info={'AI-powered advisory platform, accessible via mobile app in regional language (Malayalam-first).'}></Card>
              <Card title={'Multi-Modal Support'}
                    image={'./cam.svg'}
                    info={'Handles text, voice, and image queries (e.g., diseased crop photo) with advanced AI processing.'}
              ></Card>
              <Card title={'Expert Network'}
                    image={'./web.svg'}
              info={'Connect with agricultural experts and get personalized advice for your specific farming needs.'}
              ></Card>
          </div>
          <div className={'stats'}>
              <div className={'stats-content'}>
                  <h1>10K+</h1>
                  <h2>Active Farmers</h2>
              </div>
              <div className={'stats-content'}>
                  <h1>95%</h1>
                  <h2>Accuracy Rate</h2>
              </div>
              <div className={'stats-content'}>
                  <h1>24/7</h1>
                  <h2>Support Available</h2>
              </div>
              <div className={'stats-content'}>
                  <h1>50+</h1>
                  <h2>Crop Types</h2>
              </div>
          </div>
          <div className={'footer'}>

          </div>
      </div>
    </section>
  </>
);

export default HomePage;