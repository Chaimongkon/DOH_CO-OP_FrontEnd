import { DownloadForm } from "@/types";

/**
 * Valid member types for SRD forms
 */
export const VALID_MEMBER_TYPES = [
  "สมาชิกสามัญประเภท ก",
  "สมาชิกสามัญประเภท ข", 
  "สมาชิกสมทบ",
  "สมาชิกประเภท ก ข สมทบ",
  "สหกรณ์ฯ",
] as const;

export type ValidMemberType = typeof VALID_MEMBER_TYPES[number];

/**
 * Groups forms by member type in the correct order
 */
export const groupFormsByMember = (forms: DownloadForm[]) => {
  const grouped = forms.reduce((groups, form) => {
    const { typeMember } = form;
    if (VALID_MEMBER_TYPES.includes(typeMember as ValidMemberType)) {
      if (!groups[typeMember]) {
        groups[typeMember] = [];
      }
      groups[typeMember].push(form);
    }
    return groups;
  }, {} as { [key: string]: DownloadForm[] });

  return Object.keys(grouped)
    .sort((a, b) => VALID_MEMBER_TYPES.indexOf(a as ValidMemberType) - VALID_MEMBER_TYPES.indexOf(b as ValidMemberType))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as { [key: string]: DownloadForm[] });
};