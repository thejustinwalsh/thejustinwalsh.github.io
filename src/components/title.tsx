import { Helmet } from "react-helmet";
import { siteMetadata } from "../../site-data.json";

type TitleProps = {
  title: string;
  lang?: string;
};

export default function Title({ title, lang = "en" }: TitleProps) {
  const defaultTitle = siteMetadata.title;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={defaultTitle && `%s | ${defaultTitle}`}
    ></Helmet>
  );
}
