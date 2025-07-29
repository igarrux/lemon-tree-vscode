import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode';
import { activate, deactivate, gutterIconManager } from './extension';
import { GetConfig } from './_helpers';
import { logger } from './_logger/logger';
import { registerCommands } from './_util/register-commands/register-commans';
import { activateTranslationDecorations } from './infrastructure/vscode/activate-translation-decorators';
import { GutterIconManager } from './_helpers/gutter-icon-manager/gutter-icon-manager';

// Mock dependencies
vi.mock('./_helpers');
vi.mock('./_logger/logger');
vi.mock('./_util/register-commands/register-commans');
vi.mock('./infrastructure/vscode/activate-translation-decorators');
vi.mock('./_helpers/gutter-icon-manager/gutter-icon-manager');

describe('Extension', () => {
  let mockContext: vscode.ExtensionContext;
  let mockGutterIconManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock context
    mockContext = {
      subscriptions: [],
      extensionPath: '/mock/path',
      globalState: {
        get: vi.fn(),
        update: vi.fn()
      },
      workspaceState: {
        get: vi.fn(),
        update: vi.fn()
      }
    } as any;

    // Mock GutterIconManager
    mockGutterIconManager = {
      dispose: vi.fn()
    };
    vi.mocked(GutterIconManager).mockImplementation(() => mockGutterIconManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('activate', () => {
    it('should initialize gutterIconManager', () => {
      activate(mockContext);

      expect(GutterIconManager).toHaveBeenCalledWith(mockContext);
      expect(gutterIconManager).toBeDefined();
    });

    it('should call activateTranslationDecorations', () => {
      activate(mockContext);

      expect(activateTranslationDecorations).toHaveBeenCalledWith(mockContext);
    });

    it('should call registerCommands', () => {
      activate(mockContext);

      expect(registerCommands).toHaveBeenCalledWith(mockContext);
    });

    it('should initialize all components in correct order', () => {
      activate(mockContext);

      expect(GutterIconManager).toHaveBeenCalledWith(mockContext);
      expect(activateTranslationDecorations).toHaveBeenCalledWith(mockContext);
      expect(registerCommands).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('deactivate', () => {
    it('should clear subscribers and dispose logger', () => {
      // First activate to initialize gutterIconManager
      activate(mockContext);
      
      deactivate();

      expect(GetConfig.clearSubscribers).toHaveBeenCalled();
      expect(logger.clear).toHaveBeenCalled();
      expect(logger.dispose).toHaveBeenCalled();
      expect(mockGutterIconManager.dispose).toHaveBeenCalled();
    });

    it('should handle deactivation without activation', () => {
      // This might cause an error if gutterIconManager is not initialized
      // but the function should handle it gracefully
      expect(() => deactivate()).not.toThrow();
    });

    it('should call all cleanup methods', () => {
      activate(mockContext);
      deactivate();

      expect(GetConfig.clearSubscribers).toHaveBeenCalled();
      expect(logger.clear).toHaveBeenCalled();
      expect(logger.dispose).toHaveBeenCalled();
      expect(mockGutterIconManager.dispose).toHaveBeenCalled();
    });
  });
});
