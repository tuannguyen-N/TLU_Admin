import { IconPhoto } from '@tabler/icons-react';
import type { News } from '../types';
import classes from './NewsCard.module.css';

interface Props {
  news: News;
}

export function NewsCard({ news }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={classes.card} onClick={() => window.open(news.newsUrl, '_blank')}>
      <div className={classes.imageWrapper}>
        {news.imageUrl ? (
          <img src={news.imageUrl} alt={news.title} className={classes.image} />
        ) : (
          <div className={classes.placeholder}>
            <IconPhoto size={48} />
          </div>
        )}
      </div>
      <div className={classes.content}>
        <span className={classes.source}>{news.source}</span>
        <h3 className={classes.title}>{news.title}</h3>
        {news.excerpt && <p className={classes.excerpt}>{news.excerpt}</p>}
        <div className={classes.footer}>
          <span className={classes.date}>{formatDate(news.publishDate)}</span>
          <span className={classes.readMore}>Đọc thêm →</span>
        </div>
      </div>
    </div>
  );
}