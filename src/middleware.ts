// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Rewrite URL ที่ร้องขอ /News/File/Image/... ไปยัง /api/News/File/Image/...
  if (req.nextUrl.pathname.startsWith("/News/File/Image")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL ที่ร้องขอ /News/File/Pdf/... ไปยัง /api/News/File/Pdf/...
  if (req.nextUrl.pathname.startsWith("/News/File/Pdf")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /DownloadFile/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/DownloadForm/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /SRD/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/SRD/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /PhotosCover/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/PhotosCover/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /PhotosCover/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/PhotoAll/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /PhotosCover/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/SocietyCoop/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite URL สำหรับ /PhotosCover/... ไปยัง /api/DownloadFile/...
  if (req.nextUrl.pathname.startsWith("/BusinessReport/File")) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

    // Rewrite URL สำหรับ /PhotosCover/... ไปยัง /api/DownloadFile/...
    if (req.nextUrl.pathname.startsWith("/Slides/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (req.nextUrl.pathname.startsWith("/Organizational/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (req.nextUrl.pathname.startsWith("/Serve/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (req.nextUrl.pathname.startsWith("/Application/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (req.nextUrl.pathname.startsWith("/Particles/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    if (req.nextUrl.pathname.startsWith("/DialogBoxs/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (req.nextUrl.pathname.startsWith("/ElectionDepartment/File")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  return NextResponse.next();
}

// Make sure the matcher includes all necessary routes
export const config = {
  matcher: [
    "/News/File/Image/:path*", // Matcher for image paths
    "/News/File/Pdf/:path*", // Matcher for PDF paths
    "/DownloadForm/File/:path*",
    "/SRD/File/:path*", // Matcher for download paths
    "/PhotosCover/File/:path*",
    "/PhotoAll/File/:path*", // Matcher for download paths
    "/SocietyCoop/File/:path*", // Matcher for download paths
    "/BusinessReport/File/:path*", // Matcher for download paths
    "/Slides/File/:path*", // Matcher for download paths\
    "/Organizational/File/:path*", // Matcher for download paths
    "/Serve/File/:path*", // Matcher for download paths
    "/Application/File/:path*", // Matcher for download paths
    "/Particles/File/:path*", // Matcher for download paths
    "/DialogBoxs/File/:path*", // Matcher for download paths
    "/ElectionDepartment/File/:path*", // Matcher for download paths
  ],
};
