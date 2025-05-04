import React from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import Footer from '../../components/Footer/Footer';
import './Home.scss';

const Home = () => {
  const carouselImages = [
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
      alt: 'Modern Learning Space',
      caption: 'Smart Learning Spaces for Modern Education'
    },
    {
      src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      alt: 'Collaborative Learning',
      caption: 'Enhancing Collaborative Learning Experience'
    },
    {
      src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      alt: 'Smart Technology',
      caption: 'Integrated Smart Technology Solutions'
    }
  ];

  return (
    <div className="home">
      <Header />
      <main className="home__main">
        <div className="home__carousel">
          <Carousel 
            effect="fade"
            dots={true}
            dotPosition="bottom"
            infinite={true}
            arrows={true}
            prevArrow={<LeftOutlined />}
            nextArrow={<RightOutlined />}
          >
            {carouselImages.map((image, index) => (
              <div key={index} className="home__carousel-item">
                <div 
                  className="home__carousel-image"
                  style={{ backgroundImage: `url(${image.src})` }}
                >
                  <div className="home__carousel-content">
                    <h2>{image.caption}</h2>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default Home; 