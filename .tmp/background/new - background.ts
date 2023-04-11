// src/background/background.ts

import { setupMessageListener } from './messageListener';
import { setupTabActivationListener } from './tabActivationListener';

setupMessageListener();
setupTabActivationListener();
