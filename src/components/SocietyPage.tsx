import React from "react";
import Image from "next/image";
import { Society } from "@/types/about";
import DataStates from "@/components/DataStates";
import logger from "@/lib/logger";

interface SocietyPageProps {
  /**
   * Society data
   */
  society: Society[];
  /**
   * Loading state
   */
  loading: boolean;
  /**
   * Error state
   */
  error: string | null;
  /**
   * Retry function
   */
  onRetry: () => void;
  /**
   * CSS module styles
   */
  styles: {
    readonly [key: string]: string;
  };
  /**
   * Loading text
   */
  loadingText: string;
  /**
   * Empty text
   */
  emptyText: string;
  /**
   * Empty description
   */
  emptyDescription: string;
  /**
   * Main aria label
   */
  mainLabel: string;
  /**
   * Section aria label
   */
  sectionLabel: string;
  /**
   * Section description id prefix
   */
  descriptionIdPrefix: string;
  /**
   * Section description text
   */
  descriptionText: string;
  /**
   * Title suffix text
   */
  titleSuffix: string;
  /**
   * Image alt text template
   */
  imageAltTemplate: string;
  /**
   * Image aria label template
   */
  imageAriaLabelTemplate: string;
  /**
   * Image description template
   */
  imageDescriptionTemplate: string;
  /**
   * Image width percentage
   */
  imageWidthPercent: string;
}

/**
 * Shared society page component for displaying society images
 */
export const SocietyPage: React.FC<SocietyPageProps> = ({
  society,
  loading,
  error,
  onRetry,
  styles,
  loadingText,
  emptyText,
  emptyDescription,
  mainLabel,
  sectionLabel,
  descriptionIdPrefix,
  descriptionText,
  titleSuffix,
  imageAltTemplate,
  imageAriaLabelTemplate,
  imageDescriptionTemplate,
  imageWidthPercent,
}) => {
  return (
    <DataStates
      loading={loading}
      error={error}
      isEmpty={society.length === 0}
      onRetry={onRetry}
      loadingText={loadingText}
      emptyText={emptyText}
      emptyDescription={emptyDescription}
    >
      <main role="main" aria-label={mainLabel}>
        <section 
          className={styles.section} 
          aria-label={sectionLabel}
          aria-describedby={`${descriptionIdPrefix}-description`}
        >
          <div id={`${descriptionIdPrefix}-description`} className="sr-only">
            {descriptionText}
          </div>
          {society.map((s, index) => (
            <article 
              className={styles.container} 
              key={s.id}
              aria-labelledby={`${descriptionIdPrefix}-title-${s.id}`}
            >
              <header className={styles.header}>
                <h1 
                  id={`${descriptionIdPrefix}-title-${s.id}`}
                  className={styles.title}
                  role="heading" 
                  aria-level={1}
                  tabIndex={0}
                >
                  {s.societyType} {titleSuffix}
                </h1>
              </header>
              <div 
                className={styles.imageContainer}
                role="img"
                aria-label={imageAriaLabelTemplate.replace('{societyType}', s.societyType)}
              >
                <Image
                  src={s.imagePath}
                  alt={imageAltTemplate.replace('{societyType}', s.societyType)}
                  width={800}
                  height={600}
                  className={styles.image}
                  priority={index === 0}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMz0eHxFOMkNEJygpKy8RVjYnKDk6KzwxZURUpLDRMVNSU6RUdKTU5PWldYXWVnaG1ub3J4eXqHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPS/D2ieCPh1YC1s9BjuLjILtPa2VpNOByAjPbquQB8oAHOT0Oa6hT7NdOD8bPD9qm9dKnt8/HtP+/wC+f//Z"
                  quality={90}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 800px"
                  style={{
                    width: imageWidthPercent,
                    height: 'auto',
                  }}
                  aria-describedby={`${descriptionIdPrefix}-image-desc-${s.id}`}
                  onError={() => {
                    logger.warn(`Failed to load ${s.societyType} image:`, { id: s.id, type: s.societyType });
                  }}
                />
                <div id={`${descriptionIdPrefix}-image-desc-${s.id}`} className="sr-only">
                  {imageDescriptionTemplate.replace('{societyType}', s.societyType)}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </DataStates>
  );
};

export default SocietyPage;