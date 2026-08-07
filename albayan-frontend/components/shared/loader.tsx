import "./loader.css";

type LoaderProps = {
  caption?: string;
};

export function Loader({ caption = "جارٍ التحميل..." }: LoaderProps) {
  return (
    <div className="md-loader" role="status">
      <div className="md-loader-main">
        <div className="md-loader-up">
          <div className="md-loader-bar-group">
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="md-loader-bar" key={i} />
            ))}
          </div>
          <div className="md-loader-ball-group">
            {Array.from({ length: 9 }).map((_, i) => (
              <div className="md-loader-ball-wrap" key={i}>
                <div className={`md-loader-ball md-loader-ball-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}