import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    jest.clearAllMocks();
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setImagePathForBlog', () => {
    it('should return the correct path for blog images', () => {
      const filename = 'test.jpg';
      const result = service.setImagePathForBlog(filename);
      expect(result).toBe('/images/blogs/test.jpg');
    });
  });

  describe('setImagePathForCategory', () => {
    it('should return the correct path for category images', () => {
      const filename = 'test.jpg';
      const result = service.setImagePathForCategory(filename);
      expect(result).toBe('/images/categories/test.jpg');
    });
  });

  describe('setImagePathForLandingPage', () => {
    it('should return the correct path for landing page images', () => {
      const filename = 'test.jpg';
      const result = service.setImagePathForLandingPage(filename);
      expect(result).toBe('/images/landing-page/test.jpg');
    });
  });

  describe('setImagePathForBrand', () => {
    it('should return the correct path for brand images', () => {
      const filename = 'test.jpg';
      const result = service.setImagePathForBrand(filename);
      expect(result).toBe('/images/brands/test.jpg');
    });
  });

  describe('setImagePathForProduct', () => {
    it('should return the correct path for product images', () => {
      const filename = 'test.jpg';
      const result = service.setImagePathForProduct(filename);
      expect(result).toBe('/images/products/test.jpg');
    });
  });

  describe('deleteImageByPath', () => {
    it('should delete the image if the path exists', () => {
      const path = '/images/test.jpg';
      (existsSync as jest.Mock).mockReturnValue(true);

      service.deleteImageByPath(path);

      expect(existsSync).toHaveBeenCalledWith(path);
      expect(unlinkSync).toHaveBeenCalledWith(path);
    });

    it('should not delete the image if the path does not exist', () => {
      const path = '/images/test.jpg';
      (existsSync as jest.Mock).mockReturnValue(false);

      service.deleteImageByPath(path);

      expect(existsSync).toHaveBeenCalledWith(path);
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('deleteImageByPathInDb', () => {
    it('should delete the image if the path in the database exists', () => {
      const pathInDb = 'images/test.jpg';
      const fullPath = join('.', pathInDb);
      (existsSync as jest.Mock).mockReturnValue(true);

      service.deleteImageByPathInDb(pathInDb);

      expect(existsSync).toHaveBeenCalledWith(fullPath);
      expect(unlinkSync).toHaveBeenCalledWith(fullPath);
    });

    it('should not delete the image if the path in the database does not exist', () => {
      const pathInDb = 'images/test.jpg';
      const fullPath = join('.', pathInDb);
      (existsSync as jest.Mock).mockReturnValue(false);

      service.deleteImageByPathInDb(pathInDb);

      expect(existsSync).toHaveBeenCalledWith(fullPath);
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });
});
