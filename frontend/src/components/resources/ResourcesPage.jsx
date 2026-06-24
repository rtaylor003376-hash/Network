import { RESOURCE_SECTIONS } from '../../data/resources.js';
import styles from '../../styles/ResourcesPage.module.css';

export default function ResourcesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Curated support</p>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.subtitle}>
            A clean launchpad for UVA tools, learning platforms, career guides, and work-search resources.
          </p>
        </div>
      </div>

      <div className={styles.sections}>
        {RESOURCE_SECTIONS.map((section) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <p className={styles.sectionDescription}>{section.description}</p>
              </div>
              <span className={styles.count}>{section.resources.length} resources</span>
            </div>

            <div className={styles.grid}>
              {section.resources.map((resource) => (
                <article key={resource.title} className={styles.card}>
                  <div>
                    <h3 className={styles.cardTitle}>{resource.title}</h3>
                    <p className={styles.cardDescription}>{resource.description}</p>
                  </div>
                  <a
                    className={`btn-primary ${styles.cardAction}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open resource
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
