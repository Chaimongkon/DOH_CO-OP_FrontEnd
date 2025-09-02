import { Metadata } from "next";

interface SocietyMetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

export const generateSocietyMetadata = (config: SocietyMetadataConfig): Metadata => {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [{ name: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" }],
    openGraph: {
      title: config.ogTitle,
      description: config.ogDescription,
      type: "website",
      locale: "th_TH",
      siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    },
    twitter: {
      card: "summary",
      title: config.twitterTitle,
      description: config.twitterDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
};