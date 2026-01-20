import React from "react";
import { replaceImageBaseUrl } from "../../Services/imageUrl";

type FixedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    src?: string | null;
};

export const FixedImage: React.FC<FixedImageProps> = ({ src, ...rest }) => {
    const fixedSrc = replaceImageBaseUrl(src ?? "");
    return <img src={fixedSrc} {...rest} />;
};
