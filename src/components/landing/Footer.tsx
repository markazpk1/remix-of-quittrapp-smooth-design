import { Github, Twitter } from "lucide-react";

const links = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "API Reference", "Community", "Status"],
  Legal: ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-16" id="support">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-xl font-bold text-foreground mb-3">
              Launch<span className="text-primary">Kit</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build faster. Launch smarter.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <div className="text-sm font-semibold text-foreground mb-3">{heading}</div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LaunchKit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
