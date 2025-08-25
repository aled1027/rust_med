declare module '~icons/mdi/*' {
  import { SvelteComponentTyped } from 'svelte';
  
  interface IconProps {
    class?: string;
    style?: string;
    size?: string | number;
    color?: string;
    [key: string]: any;
  }
  
  export default class Icon extends SvelteComponentTyped<IconProps> {}
}

declare module '~icons/*' {
  import { SvelteComponentTyped } from 'svelte';
  
  interface IconProps {
    class?: string;
    style?: string;
    size?: string | number;
    color?: string;
    [key: string]: any;
  }
  
  export default class Icon extends SvelteComponentTyped<IconProps> {}
}
