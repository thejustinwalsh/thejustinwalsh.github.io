import { ThemeProvider } from "../context/theme";
import { AudioProvider } from "../context/audio";
import Header from "./header";

type LayoutProps = React.PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <AudioProvider>
        <div className="flex h-screen flex-col bg-white transition-none dark:bg-black">
          <Header />
          <div className="mb-auto h-full p-10">{children}</div>
        </div>
      </AudioProvider>
    </ThemeProvider>
  );
}
