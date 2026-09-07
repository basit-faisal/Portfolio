/** Single source of truth: the mail link and the composer both read this. */
export const ownerEmail = 'basitfaisal03@gmail.com';

export const profile = {
  name: 'Basit Faisal',
  headline: 'Data Analytics Engineering @ Motive',
  roles: ['Data Engineer', 'Quant Enthusiast', 'Data Analyst', 'Data Scientist'],
  location: 'Lahore, Punjab, Pakistan',
  bio: [
    "I'm someone passionate about uncovering insights through data analysis, machine learning, and algorithmic trading. With a strong background in financial data science, I specialize in building data-driven solutions for multiple domains.",
    'From building robust data pipelines to creating meaningful visualizations, from scraping hard-to-scrape websites to building machine learning models and automating anything in between. I have a knack for questioning everything and connecting the dots.'
  ],
  resumeFile: 'Basit_Faisal_Resume.pdf'
};

export const socials = [
  { label: 'Mail', href: `mailto:${ownerEmail}`, icon: 'mail' },
  { label: 'GitHub', href: 'https://github.com/basit-faisal', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/basitfaisal/', icon: 'linkedin' }
] as const;
