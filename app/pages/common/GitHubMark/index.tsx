import { siGithub } from 'simple-icons';

// GitHub's octocat set as a picto sigil, like LinkedInMark: cyan, inside the thin kite of the game's crests.
const GitHubMark = () => (
  <svg viewBox="0 0 44 44" width="44" height="44">
    <path
      d="M22 3 L41 22 L22 41 L3 22 Z"
      fill="none"
      stroke="#3fd3cf"
      strokeWidth="1.6"
      strokeLinejoin="round"
      opacity="0.7"
    />
    <path d={siGithub.path} fill="#3fd3cf" transform="translate(13 13) scale(0.75)" />
  </svg>
);

export default GitHubMark;
