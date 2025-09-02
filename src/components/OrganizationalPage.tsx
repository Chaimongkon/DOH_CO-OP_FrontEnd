import * as React from "react";
import Image from "next/image";
import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import { BoardMember, PriorityLevel } from "@/types/organizational";
import DataStates from "@/components/DataStates";

interface OrganizationalPageProps {
  /**
   * Organizational data
   */
  organizationals: BoardMember[];
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
   * Section aria label
   */
  sectionLabel: string;
  /**
   * Default title fallback
   */
  defaultTitle: string;
}

/**
 * Shared organizational page component
 */
export const OrganizationalPage: React.FC<OrganizationalPageProps> = ({
  organizationals,
  loading,
  error,
  onRetry,
  styles,
  loadingText,
  emptyText,
  emptyDescription,
  sectionLabel,
  defaultTitle,
}) => {
  const renderByPriority = (priorityLevel: PriorityLevel) => {
    const membersInPriority = organizationals.filter((p) => p.priority === priorityLevel);
    
    if (membersInPriority.length === 0) return null;
    
    return (
      <div>
        <h2 className="sr-only">กลุ่มลำดับความสำคัญ {priorityLevel}</h2>
        <ul className="rows gy-5" role="list" aria-labelledby="page-title" style={{ listStyle: "none" }}>
          {membersInPriority.map((p) => (
            <li className="col-lg-33 col-md-6" key={p.id} role="listitem">
              <div className="product h-100">
                <div className="box-image">
                  <Box
                    sx={{
                      justifyContent: "center",
                      display: "flex",
                      p: 2,
                      m: 0,
                      gap: 3,
                    }}
                  >
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        width: 220, 
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)' 
                      }}
                      role="article"
                      aria-labelledby={`member-${p.id}-name`}
                      aria-describedby={`member-${p.id}-position`}
                    >
                      <CardOverflow>
                        <AspectRatio ratio="0.9">
                          <Image 
                            src={p.imagePath} 
                            alt={`รูปถ่าย ${p.name} ${p.position}`}
                            width={220}
                            height={245}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            sizes="220px"
                            priority={priorityLevel === "1"}
                          />
                        </AspectRatio>
                      </CardOverflow>
                      <CardContent>
                        <Typography
                          component="h2"
                          id={`member-${p.id}-name`}
                          sx={{
                            fontFamily: "DOHCOOP",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                          role="heading"
                          aria-level={2}
                        >
                          {p.name}
                        </Typography>
                        <Typography
                          id={`member-${p.id}-position`}
                          sx={{
                            fontFamily: "DOHCOOP",
                            fontSize: "0.921rem",
                            textAlign: "center",
                          }}
                        >
                          {p.position}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <DataStates
      loading={loading}
      error={error}
      isEmpty={organizationals.length === 0}
      onRetry={onRetry}
      loadingText={loadingText}
      emptyText={emptyText}
      emptyDescription={emptyDescription}
    >
      <section className={styles.section} aria-label={sectionLabel}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title} role="heading" aria-level={1} id="page-title">
              {organizationals.length > 0 ? organizationals[0].type : defaultTitle}
            </h1>
          </header>
          {renderByPriority("1")}
          {renderByPriority("2")}
          {renderByPriority("3")}
          {renderByPriority("4")}
          {renderByPriority("5")}
        </div>
      </section>
    </DataStates>
  );
};

export default OrganizationalPage;