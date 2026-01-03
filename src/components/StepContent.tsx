interface StepResource {
  id: string;
  title: string;
  url: string;
  resource_type:
    | "text"
    | "image"
    | "video"
    | "reference"
    | "practice";
}

interface Props {
  resources: StepResource[];
  preferredFormat?: string;
}

export default function StepContent({
  resources,
  preferredFormat,
}: Props) {
  const format = preferredFormat ?? "mixed";

  let filtered = resources;

  if (format === "images") {
    filtered = resources.filter(r => r.resource_type === "image");
  }
  if (format === "videos") {
    filtered = resources.filter(r => r.resource_type === "video");
  }
  if (format === "text") {
    filtered = resources.filter(r => r.resource_type === "text");
  }

  return (
    <div className="space-y-10">
      {filtered.map((res) => {
        if (res.resource_type === "text") {
          return (
            <div key={res.id} className="prose prose-lg max-w-none">
              {res.url}
            </div>
          );
        }

        if (res.resource_type === "image") {
          return (
            <img
              key={res.id}
              src={res.url}
              alt={res.title}
              className="w-full rounded-xl"
            />
          );
        }

        if (res.resource_type === "video") {
          let video;
          try {
            video = JSON.parse(res.url);
          } catch {
            return null;
          }

          if (!video?.query) return null;

          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `${video.query} ${video.channel ?? ""}`
          )}`;

          return (
            <a
              key={res.id}
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-muted p-5 hover:bg-muted/80 transition"
            >
              <p className="text-lg font-semibold">Watch on YouTube</p>
              <p className="text-sm text-muted-foreground">
                {video.query}
                {video.channel && ` — ${video.channel}`}
              </p>
            </a>
          );
        }

        if (res.resource_type === "reference") {
          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              🔗 {res.title}
            </a>
          );
        }

        if (res.resource_type === "practice") {
          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-secondary p-4 hover:bg-secondary/80"
            >
              🧪 Practice on {res.title}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}