import { LinkButton } from '@/components/link-button'

export function CtaSection() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta-copy">
        <h2 id="cta-title" className="md-typescale-headline-large text-balance">
          Your next chapter could be fully funded
        </h2>
        <p className="md-typescale-body-large">
          Explore the full catalog or create a free profile to get personalized matches.
        </p>
      </div>
      <div className="cta-actions">
        <LinkButton href="/scholarships" variant="elevated" icon="arrow_forward" trailingIcon>
          Explore scholarships
        </LinkButton>
        <LinkButton href="/register" variant="outlined" className="cta-outline">
          Create free account
        </LinkButton>
      </div>
    </section>
  )
}
