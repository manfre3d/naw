import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ProjectsSection } from '../models/descriptor.model';

const mockSection: ProjectsSection = {
  id: 'projects',
  type: 'PROJECTS',
  style: 'SECTION',
  label: 'Work',
  title: 'Featured Work',
  linkLabel: 'View on GitHub',
  elements: [
    { img: 'a.jpg', name: 'Alpha', description: 'First', tags: ['Angular'], status: 'Live', link: 'https://example.com/a' },
    { img: 'b.jpg', name: 'Beta', description: 'Second' },
    { img: 'c.jpg', name: 'Gamma', description: 'Third', liveUrl: 'https://example.com/c' }
  ]
};

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('subDescriptor', mockSection);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one slide per project', () => {
    const slides = fixture.nativeElement.querySelectorAll('.project-slide');
    expect(slides.length).toBe(mockSection.elements.length);
  });

  it('starts on the first page with sane defaults', () => {
    expect(component.activePage()).toBe(0);
    expect(component.pages()).toBeGreaterThanOrEqual(1);
    expect(component.pageList().length).toBe(component.pages());
  });

  it('does not scroll before the first page or past the last', () => {
    expect(() => component.prev()).not.toThrow();
    expect(component.activePage()).toBe(0);
    expect(() => component.goTo(999)).not.toThrow();
    expect(component.activePage()).toBeLessThanOrEqual(component.pages() - 1);
  });
});
