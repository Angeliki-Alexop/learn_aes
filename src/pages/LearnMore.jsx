import React, { useEffect, useRef, useState } from "react";
import { Container, Typography, Box, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useTranslation } from "react-i18next";
import '../styles/LearnMore.css';

function LearnMore() {
  const { t } = useTranslation();
  // Load images placed in src/assets/learn_more. The filenames determine order.
  const imageEntries = Object.entries(import.meta.glob('../assets/learn_more/*', { as: 'url', eager: true }));
  const imagesSorted = imageEntries
    .map(([path, url]) => ({ path, url, name: path.split('/').pop() }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map(e => e.url);

  const sectionsMeta = [
    {
      titleKey: 'learnMore.sections.whatIsAES.title',
      textKey: 'learnMore.sections.whatIsAES.text',
      captionKey: 'learnMore.sections.whatIsAES.caption'
    },
    {
      titleKey: 'learnMore.sections.keySharing.title',
      textKey: 'learnMore.sections.keySharing.text',
      captionKey: 'learnMore.sections.keySharing.caption'
    },
    {
      titleKey: 'learnMore.sections.encryptionRounds.title',
      textKey: 'learnMore.sections.encryptionRounds.text',
      captionKey: 'learnMore.sections.encryptionRounds.caption'
    },
    {
      titleKey: 'learnMore.sections.decryptionRounds.title',
      textKey: 'learnMore.sections.decryptionRounds.text',
      captionKey: 'learnMore.sections.decryptionRounds.caption'
    }
  ];

  const sections = sectionsMeta.map((meta, i) => ({ 
    title: t(meta.titleKey),
    text: t(meta.textKey),
    linkText: t(`${meta.textKey.replace('.text', '.linkText')}`, ''),
    linkUrl: t(`${meta.textKey.replace('.text', '.linkUrl')}`, ''),
    caption: t(meta.captionKey),
    img: imagesSorted[i] || null 
  }));

  const containerRef = useRef(null);
  const refs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if (!containerRef.current) return;
      // find current section index relative to container scroll position
      const container = containerRef.current;
      const containerTop = container.scrollTop;
      const index = refs.current.findIndex(r => r && Math.abs(r.offsetTop - containerTop) < container.clientHeight/2);
      if (e.key === 'ArrowDown') {
        const next = Math.min(refs.current.length - 1, (index === -1 ? 0 : index) + 1);
        scrollToIndex(next);
      } else if (e.key === 'ArrowUp') {
        const prev = Math.max(0, (index === -1 ? 0 : index) - 1);
        scrollToIndex(prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // prevent the outer page from scrolling while inside this full-height view
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const scrollToIndex = (i) => {
    const container = containerRef.current;
    const el = refs.current[i];
    if (!container || !el) return;
    // scroll within the container so the site Navbar (outside) remains visible
    container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };

  // update currentIndex on container scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      let closest = 0;
      let minDiff = Infinity;
      refs.current.forEach((r, idx) => {
        if (!r) return;
        const diff = Math.abs(r.offsetTop - scrollTop);
        if (diff < minDiff) {
          minDiff = diff;
          closest = idx;
        }
      });
      setCurrentIndex(closest);
    };
    // initial set
    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Container className="learn-page-root" maxWidth={false}>
      <header className="learn-header">
        <Typography variant="h4" component="h1">{t('learnMore.pageTitle', 'What is AES')}</Typography>
        <Typography variant="body1" className="learn-sub">{t('learnMore.pageSubtitle', 'An approachable overview of AES and its main stages.')}</Typography>
      </header>

      <main ref={containerRef} className="learn-container">
        {sections.map((s, i) => (
          <section key={s.title} className="learn-section" ref={el => refs.current[i] = el}>
            <Box className="learn-content">
              <div className="learn-text">
                <Typography variant="h5" component="h2">{s.title}</Typography>
                <Typography variant="body1" className="learn-description">
                  {s.text}
                  {s.linkText && s.linkUrl && (
                    <a href={s.linkUrl} target="_blank" rel="noopener noreferrer">
                      {s.linkText}
                    </a>
                  )}
                  {s.linkText && s.linkUrl && '.'}
                </Typography>
                <Typography variant="caption" display="block" className="learn-caption">{s.caption}</Typography>
              </div>
              <figure className="learn-figure">
                <img src={s.img} alt={s.title} />
              </figure>
            </Box>
            {/* per-section footer kept for accessibility but visually hidden; floating nav handles navigation */}
            <div className="learn-section-footer" aria-hidden>
              <IconButton aria-label={t('learnMore.navigation.upAriaLabel', 'up')} className="nav-up" onClick={() => scrollToIndex(Math.max(0, i-1))}>
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton aria-label={t('learnMore.navigation.downAriaLabel', 'down')} className="nav-down" onClick={() => scrollToIndex(Math.min(refs.current.length-1, i+1))}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </div>
          </section>
        ))}
      </main>

      {/* floating always-visible navigation */}
      <div className="learn-floating-nav" role="navigation" aria-label={t('learnMore.navigation.sectionNavigation', 'Section navigation')}>
        <IconButton aria-label={t('learnMore.navigation.upAriaLabel', 'up')} onClick={() => scrollToIndex(Math.max(0, currentIndex-1))} className="nav-up">
          <KeyboardArrowUpIcon />
        </IconButton>
        <IconButton aria-label={t('learnMore.navigation.downAriaLabel', 'down')} onClick={() => scrollToIndex(Math.min(refs.current.length-1, currentIndex+1))} className="nav-down">
          <KeyboardArrowDownIcon />
        </IconButton>
      </div>
    </Container>
  );
}

export default LearnMore;