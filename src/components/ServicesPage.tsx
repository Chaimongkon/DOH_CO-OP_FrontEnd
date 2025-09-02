'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Services } from '@/types';
import { useServices } from '@/hooks/useServices';

interface ServicesPageProps {
  subcategory: string;
  customLabels?: string[];
  initialData?: Services[];
  className?: string;
}

const ServicesPage: React.FC<ServicesPageProps> = memo(({
  subcategory,
  customLabels = [],
  initialData = [],
  className = ''
}) => {
  const { services, loading, error } = useServices(subcategory, initialData);

  if (loading) {
    return (
      <section className={`py-5 ${className}`}>
        <div className="container py-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-5 ${className}`}>
        <div className="container py-4 text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section className={`py-5 ${className}`}>
        <div className="container py-4 text-center">
          <p>ไม่พบข้อมูลบริการ</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-5 ${className}`}>
      {services.map((service) => (
        <div className="container py-4" key={service.id}>
          <center>
            <Image
              className="img-fluid-7"
              src={service.imagePath}
              alt={`Service Image for ${service.subcategories}`}
              width={800}
              height={600}
              priority
            />
          </center>
          
          {((service.urlLinks && service.urlLinks.length > 0) || service.urlLink) && (
            <div className="container py-4">
              <div className="row gy-4">
                <h3 className="text-uppercase lined mb-4">
                  ดาวน์โหลดเอกสาร
                </h3>
              </div>
              <ul className="list-unstyled">
                {service.urlLinks && service.urlLinks.length > 0 ? (
                  // Multiple URLs (like EmergencyLoan)
                  service.urlLinks.map((link: string, index: number) => (
                    <li className="d-flex mb-3" key={index}>
                      <div className="icon-filled2 me-2">
                        <i className="fas fa-download"></i>
                      </div>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <p className="text-sm312 mb-0">
                          {customLabels[index] || `แบบฟอร์ม ${service.subcategories}`}
                        </p>
                      </a>
                    </li>
                  ))
                ) : (
                  // Single URL (most services)
                  service.urlLink && (
                    <li className="d-flex mb-3">
                      <div className="icon-filled2 me-2">
                        <i className="fas fa-download"></i>
                      </div>
                      <a
                        href={service.urlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        <p className="text-sm312 mb-0">
                          แบบฟอร์ม{service.subcategories}
                        </p>
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  );
});

ServicesPage.displayName = 'ServicesPage';

export default ServicesPage;