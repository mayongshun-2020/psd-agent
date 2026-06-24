import "./globals.css";

export const metadata = {
  title: "PSD Detail Page Agent",
  description: "详情页自动生成工作流调试台",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
